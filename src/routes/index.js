import express from 'express';
import { createDirectus, staticToken, rest, createCollection, readCollections, createRelation, readItem } from '@directus/sdk';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to write errors to file
const writeErrorToFile = (error) => {
    fs.writeFile('error.json', JSON.stringify(error), (err) => {
        if (err) {
            console.error('Error writing to error file:', err);
        } else {
            console.log('Error written to error.json');
        }
    });
};

// Helper function to handle API requests with error handling
async function safeApiRequest(apiCall, errorMessage) {
    try {
        return await apiCall();
    } catch (error) {
        writeErrorToFile(error);
        console.error(errorMessage, error.message);
        throw error; // Propagate error for caller to handle
    }
}

// Create a collection with proper error handling
async function createTableCollection(collectionData, name, groupName = null) {
    collectionData.collection = name;
    collectionData.meta.collection = name;
    collectionData.schema.name = name;
    
    if (groupName) {
        collectionData.meta.group = groupName;
    }
    
    await safeApiRequest(
        () => client.request(createCollection(collectionData)),
        `Error creating collection ${name}:`
    );
}

// Create a relation with proper error handling
async function createTableRelation(relationData, collectionName, relatedCollectionName = null, isOneToMany = false) {
    relationData.collection = collectionName;
    relationData.schema.table = collectionName;
    relationData.meta.many_collection = collectionName;
    
    if (relatedCollectionName) {
        relationData.related_collection = relatedCollectionName;
        relationData.schema.foreign_key_table = relatedCollectionName;
        relationData.meta.one_collection = relatedCollectionName;
    }
    
    await safeApiRequest(
        () => client.request(createRelation(relationData)),
        `Error creating relation for ${relationData.field}:`
    );
}

// Main table creation function
async function main_table(name, fields, header) {
    try {
        fields.main.table.meta.translations[0].translation += header;
        fields.main.table.meta.translations[1].translation += header;

        await createTableCollection(fields.main.table, name);
        
        for (const relation of fields.main.relations) {
            relation.schema.name = name;
            await createTableRelation(relation, name);
        }
    } catch (error) {
        console.error('Failed to create main table:', error.message);
    }
}

// Generic function for creating junction tables
async function createJunctionTable(fields, mainName, tableType) {
    const tableName = `${mainName}_${tableType}`;
    
    try {
        await createTableCollection(fields[tableType].table, tableName, mainName);
        
        // Create relation to main table
        await createTableRelation(
            fields[tableType].relations[0], 
            tableName, 
            mainName, 
            true
        );
        
        // Create relation to the related entity
        await createTableRelation(
            fields[tableType].relations[1], 
            tableName
        );
    } catch (error) {
        console.error(`Failed to create ${tableType} table:`, error.message);
    }
}

// Specific table creation functions that use the generic function
async function executors_table(fields, mainName) {
    await createJunctionTable(fields, mainName, 'executors');
}

async function contacts_table(fields, mainName) {
    await createJunctionTable(fields, mainName, 'contacts');
}

async function tasks_table(fields, mainName) {
    await createJunctionTable(fields, mainName, 'tasks');
}

async function files_table(fields, mainName) {
    await createJunctionTable(fields, mainName, 'files');
}

// Initialize the Directus client
const client = createDirectus('http://directus')
    .with(staticToken('3ZIXPuKw0aD9KzWtVv0Gn3KGyLsbQr9K'))
    .with(rest());

router.post('/new_collection', express.json(), async (req, res) => {
    try {
        const itemId = req.body.id;
        
        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }
        
        const _name = await client.request(readItem("deals", itemId));
        const name = _name.id;
        const header = _name.header;
        const fields = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'table.json')));
        
        console.log(`Creating tables for ${name}...`);
        
        await main_table(name, fields, header);
        await executors_table(fields, name);
        await contacts_table(fields, name);
        await tasks_table(fields, name);
        await files_table(fields, name);
        
        console.log(`Successfully created all tables for ${name}`);
        
        res.status(200).json({ 
            success: true, 
            message: `Successfully created collections for ${header}`,
            collections: [
                name,
                `${name}_executors`,
                `${name}_contacts`,
                `${name}_tasks`,
                `${name}_files`
            ]
        });
    } catch (error) {
        console.error('Failed to create tables:', error.message);
        res.status(500).json({ 
            error: 'Failed to create collections', 
            message: error.message 
        });
    }
});

export default router;