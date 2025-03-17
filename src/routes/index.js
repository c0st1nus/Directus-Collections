import express from 'express';
import { createDirectus, staticToken, rest, deleteCollection, createCollection, readCollections, createItem, readCollection } from '@directus/sdk';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const router = express.Router();

// Root route for testing
router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

router.post('/test', express.json(), async (req, res) => {
    const client = createDirectus('http://localhost:2000').with(staticToken('Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq')).with(rest());
    // const data = req.body;
    const result = client.request(
        readCollections("projects")
    );
    result.then(data => {
        fs.writeFile('test.json', JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file', err);
                res.status(500).send('Error writing to file');
            } else {
                console.log('Data saved to test.json');
                res.status(200).send('Data saved to test.json');
            }
        });
    }).catch(error => {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    });
    
    res.status(200).send('Tables deleted');
});


router.post('/delete_project', express.json(), async (req, res) => {
    const client = createDirectus('http://localhost:2000').with(staticToken('Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq')).with(rest());
    const data = req.body;
    const tables = ['p_${data.header}', 'p_${data.header}_files', 'p_${data.header}_directus_users', 'p_${data.header}_contacts', 'p_${data.header}_milestones'];
    for (let i = 0; i < tables.length; i++) {
        client.request(
            deleteCollection(tables[i])
        );
    }
    res.status(200).send('Tables deleted');
});

router.post('/new_table', express.json(), async (req, res) => {
    try {
        const client = createDirectus('http://localhost:2000').with(staticToken('Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq')).with(rest());

        const data = req.body;

        if (!data.header) {
            return res.status(400).json({
                success: false,
                message: 'Error: header is required'
            });
        }

        // Check if collections already exist
        const collections = await client.request(readCollections());
        const collectionNames = [
            `p_${data.header}`,
            `p_${data.header}_files`,
            `p_${data.header}_directus_users`,
            `p_${data.header}_contacts`,
            `p_${data.header}_milestones`
        ];
        
        const existingCollections = collectionNames.filter(name => 
            collections.some(collection => collection.collection === name)
        );

        if (existingCollections.length > 0) {
            return res.status(400).json({
                success: false,
                message: `The following collections already exist: ${existingCollections.join(', ')}`,
                existingCollections
            });
        }

        // Create main collection (similar to projects)
        await client.request(
            createCollection({
                collection: `p_${data.header}`,
                meta: {
                    collection: `p_${data.header}`,
                    icon: "cases",
                    note: null,
                    display_template: "{{header}}",
                    hidden: false,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: "archived",
                    unarchive_value: "draft",
                    sort_field: null,
                    accountability: "all",
                    color: null,
                    item_duplication_fields: null,
                    sort: null,
                    group: "projects",
                    collapse: "open",
                    preview_url: null,
                    versioning: false
                },
                schema: {
                    name: `p_${data.header}`,
                    comment: null,
                    fields: [
                        {
                            field: "id",
                            type: "uuid",
                            meta: {
                                special: ["uuid"],
                                interface: "input",
                                options: null,
                                display: null,
                                display_options: null,
                                readonly: false,
                                hidden: true,
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "id",
                                table: `p_${data.header}`,
                                data_type: "char",
                                default_value: null,
                                max_length: 36,
                                numeric_precision: null,
                                numeric_scale: null,
                                is_nullable: false,
                                is_unique: true,
                                is_primary_key: true,
                                is_generated: false,
                                generation_expression: null,
                                has_auto_increment: false,
                                foreign_key_table: null,
                                foreign_key_column: null
                            }
                        },
                        {
                            field: "created_by",
                            type: "uuid",
                            meta: {
                                special: ["user-created"],
                                interface: "select-dropdown-m2o",
                                options: {
                                    template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}"
                                },
                                display: "user",
                                readonly: true,
                                hidden: true,
                                width: "half",
                                sort: null,
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "created_by",
                                table: `p_${data.header}`,
                                data_type: "char",
                                default_value: null,
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "directus_users",
                                foreign_key_column: "id"
                            }
                        },
                        {
                            field: "created_at",
                            type: "timestamp",
                            meta: {
                                special: ["date-created"],
                                interface: "datetime",
                                readonly: true,
                                hidden: true,
                                width: "half",
                                sort: null,
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "created_at",
                                table: `p_${data.header}`,
                                data_type: "datetime",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "updated_by",
                            type: "uuid",
                            meta: {
                                special: ["user-updated"],
                                interface: "select-dropdown-m2o",
                                options: {
                                    template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}"
                                },
                                display: "user",
                                readonly: true,
                                hidden: true,
                                width: "half",
                                sort: null,
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "updated_by",
                                table: `p_${data.header}`,
                                data_type: "char",
                                default_value: null,
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "directus_users",
                                foreign_key_column: "id"
                            }
                        },
                        {
                            field: "updated_at",
                            type: "timestamp",
                            meta: {
                                special: ["date-updated"],
                                interface: "datetime",
                                readonly: true,
                                hidden: true,
                                width: "half",
                                sort: null,
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "updated_at",
                                table: `p_${data.header}`,
                                data_type: "datetime",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "header",
                            type: "string",
                            meta: {
                                interface: "input",
                                special: null,
                                required: false,
                                options: {
                                    trim: true
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "header",
                                table: `p_${data.header}`,
                                data_type: "varchar",
                                default_value: null,
                                max_length: 255,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "additional_points",
                            type: "json",
                            meta: {
                                interface: "list",
                                special: ["cast-json"],
                                options: {
                                    template: "{{text}}",
                                    fields: [
                                        {
                                            field: "text",
                                            type: "string",
                                            name: "Text",
                                            meta: {
                                                field: "text",
                                                type: "string",
                                                interface: "input",
                                                options: {
                                                    trim: true
                                                }
                                            }
                                        }
                                    ]
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "additional_points",
                                table: `p_${data.header}`,
                                data_type: "json",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "notes",
                            type: "text",
                            meta: {
                                interface: "input-rich-text-md",
                                special: null,
                                options: {
                                    trim: true
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "notes",
                                table: `p_${data.header}`,
                                data_type: "text",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "deal",
                            type: "uuid",
                            meta: {
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                options: {
                                    template: "{{name}}"
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "deal",
                                table: `p_${data.header}`,
                                data_type: "char",
                                default_value: null,
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "deals",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        },
                        {
                            field: "transaction_amount",
                            type: "float",
                            meta: {
                                interface: "input",
                                special: null,
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "transaction_amount",
                                table: `p_${data.header}`,
                                data_type: "float",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "tags",
                            type: "json",
                            meta: {
                                interface: "tags",
                                special: ["cast-json"],
                                options: {
                                    iconLeft: "local_offer"
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "tags",
                                table: `p_${data.header}`,
                                data_type: "json",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false
                            }
                        },
                        {
                            field: "status",
                            type: "integer",
                            meta: {
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                options: {
                                    template: "{{name}}"
                                },
                                sort: null,
                                width: "full",
                                translations: null,
                                note: null,
                                conditions: null,
                                required: false,
                                group: null,
                                validation: null,
                                validation_message: null
                            },
                            schema: {
                                name: "status",
                                table: `p_${data.header}`,
                                data_type: "integer",
                                default_value: null,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "status_list",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        }
                    ]
                }
            })
        );

        // Create files junction collection
        await client.request(
            createCollection({
                collection: `p_${data.header}_files`,
                meta: {
                    collection: `p_${data.header}_files`,
                    icon: "import_export",
                    note: null,
                    display_template: null,
                    hidden: true,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: null,
                    unarchive_value: null,
                    sort_field: null,
                    accountability: "all",
                    color: null,
                    item_duplication_fields: null,
                    sort: null,
                    group: "projects",
                    collapse: "open",
                    preview_url: null,
                    versioning: false
                },
                schema: {
                    name: `p_${data.header}_files`,
                    comment: null,
                    fields: [
                        {
                            field: "id",
                            type: "integer",
                            meta: {
                                hidden: true,
                                interface: "input",
                                readonly: true,
                                required: false
                            },
                            schema: {
                                name: "id",
                                table: `p_${data.header}_files`,
                                data_type: "integer",
                                is_nullable: false,
                                is_unique: false,
                                is_primary_key: true,
                                has_auto_increment: true
                            }
                        },
                        {
                            field: `p_${data.header}_id`,
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: `p_${data.header}_id`,
                                table: `p_${data.header}_files`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: `p_${data.header}`,
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        },
                        {
                            field: "directus_files_id",
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: "directus_files_id",
                                table: `p_${data.header}_files`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "directus_files",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        }
                    ]
                }
            })
        );

        // Create directus_users junction collection
        await client.request(
            createCollection({
                collection: `p_${data.header}_directus_users`,
                meta: {
                    collection: `p_${data.header}_directus_users`,
                    icon: "import_export",
                    note: null,
                    display_template: null,
                    hidden: true,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: null,
                    unarchive_value: null,
                    sort_field: null,
                    accountability: "all",
                    color: null,
                    item_duplication_fields: null,
                    sort: null,
                    group: "projects",
                    collapse: "open",
                    preview_url: null,
                    versioning: false
                },
                schema: {
                    name: `p_${data.header}_directus_users`,
                    comment: null,
                    fields: [
                        {
                            field: "id",
                            type: "integer",
                            meta: {
                                hidden: true,
                                interface: "input",
                                readonly: true,
                                required: false
                            },
                            schema: {
                                name: "id",
                                table: `p_${data.header}_directus_users`,
                                data_type: "integer",
                                is_nullable: false,
                                is_unique: false,
                                is_primary_key: true,
                                has_auto_increment: true
                            }
                        },
                        {
                            field: `p_${data.header}_id`,
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: `p_${data.header}_id`,
                                table: `p_${data.header}_directus_users`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: `p_${data.header}`,
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        },
                        {
                            field: "directus_users_id",
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: "directus_users_id",
                                table: `p_${data.header}_directus_users`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "directus_users",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        }
                    ]
                }
            })
        );

        // Create contacts junction collection
        await client.request(
            createCollection({
                collection: `p_${data.header}_contacts`,
                meta: {
                    collection: `p_${data.header}_contacts`,
                    icon: "import_export",
                    note: null,
                    display_template: null,
                    hidden: true,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: null,
                    unarchive_value: null,
                    sort_field: null,
                    accountability: "all",
                    color: null,
                    item_duplication_fields: null,
                    sort: null,
                    group: "projects",
                    collapse: "open",
                    preview_url: null,
                    versioning: false
                },
                schema: {
                    name: `p_${data.header}_contacts`,
                    comment: null,
                    fields: [
                        {
                            field: "id",
                            type: "integer",
                            meta: {
                                hidden: true,
                                interface: "input",
                                readonly: true,
                                required: false
                            },
                            schema: {
                                name: "id",
                                table: `p_${data.header}_contacts`,
                                data_type: "integer",
                                is_nullable: false,
                                is_unique: false,
                                is_primary_key: true,
                                has_auto_increment: true
                            }
                        },
                        {
                            field: `p_${data.header}_id`,
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: `p_${data.header}_id`,
                                table: `p_${data.header}_contacts`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: `p_${data.header}`,
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        },
                        {
                            field: "contacts_id",
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: "contacts_id",
                                table: `p_${data.header}_contacts`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "contacts",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        }
                    ]
                }
            })
        );

        // Create milestones junction collection
        await client.request(
            createCollection({
                collection: `p_${data.header}_milestones`,
                meta: {
                    collection: `p_${data.header}_milestones`,
                    icon: "import_export",
                    note: null,
                    display_template: null,
                    hidden: true,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: null,
                    unarchive_value: null,
                    sort_field: null,
                    accountability: "all",
                    color: null,
                    item_duplication_fields: null,
                    sort: null,
                    group: "projects",
                    collapse: "open",
                    preview_url: null,
                    versioning: false
                },
                schema: {
                    name: `p_${data.header}_milestones`,
                    comment: null,
                    fields: [
                        {
                            field: "id",
                            type: "integer",
                            meta: {
                                hidden: true,
                                interface: "input",
                                readonly: true,
                                required: false
                            },
                            schema: {
                                name: "id",
                                table: `p_${data.header}_milestones`,
                                data_type: "integer",
                                is_nullable: false,
                                is_unique: false,
                                is_primary_key: true,
                                has_auto_increment: true
                            }
                        },
                        {
                            field: `p_${data.header}_id`,
                            type: "uuid",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: `p_${data.header}_id`,
                                table: `p_${data.header}_milestones`,
                                data_type: "char",
                                max_length: 36,
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: `p_${data.header}`,
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        },
                        {
                            field: "milestones_id",
                            type: "integer",
                            meta: {
                                hidden: true,
                                interface: "select-dropdown-m2o",
                                special: ["m2o"],
                                required: false
                            },
                            schema: {
                                name: "milestones_id",
                                table: `p_${data.header}_milestones`,
                                data_type: "integer",
                                is_nullable: true,
                                is_unique: false,
                                is_primary_key: false,
                                foreign_key_table: "milestones",
                                foreign_key_column: "id",
                                on_update: "NO ACTION",
                                on_delete: "SET NULL"
                            }
                        }
                    ]
                }
            })
        );

        return res.status(200).json({
            success: true,
            message: 'Collections created successfully',
            collections: collectionNames
        });
    } catch (error) {
        console.error('Error in /new_table route:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/create_item', express.json(), async (req, res) => {
    try {
        const client = createDirectus('http://localhost:2000').with(staticToken('Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq')).with(rest());

        const data = req.body;

        if (!data.collection) {
            return res.status(400).json({
                success: false,
                message: 'Error: collection is required'
            });
        }

        if (!data.item) {
            return res.status(400).json({
                success: false,
                message: 'Error: item is required'
            });
        }

        // Check if collection exists
        try {
            await client.request(readCollection(data.collection));
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: `Collection "${data.collection}" not found`,
                error: error.message
            });
        }

        // Generate UUID for the item if not provided
        if (!data.item.id) {
            data.item.id = uuidv4();
        }

        // Process relational fields
        const contacts = data.item.contacts || [];
        const executors = data.item.executors || [];
        const files = data.item.files || [];
        const tasks = data.item.tasks || [];

        // Remove relational fields from the main item
        delete data.item.contacts;
        delete data.item.executors;
        delete data.item.files;
        delete data.item.tasks;

        // Create the main item
        const createdItem = await client.request(
            createItem(data.collection, data.item)
        );

        const results = {
            main: createdItem,
            relations: {
                contacts: [],
                executors: [],
                files: [],
                tasks: []
            }
        };

        // Create relations for contacts
        if (contacts.length > 0) {
            for (const contactId of contacts) {
                try {
                    const contactRelation = await client.request(
                        createItem(`${data.collection}_contacts`, {
                            [`${data.collection}_id`]: createdItem.id,
                            contacts_id: contactId
                        })
                    );
                    results.relations.contacts.push(contactRelation);
                } catch (error) {
                    console.error(`Error creating contact relation: ${error.message}`);
                }
            }
        }

        // Create relations for executors (directus_users)
        if (executors.length > 0) {
            for (const executorId of executors) {
                try {
                    const executorRelation = await client.request(
                        createItem(`${data.collection}_directus_users`, {
                            [`${data.collection}_id`]: createdItem.id,
                            directus_users_id: executorId
                        })
                    );
                    results.relations.executors.push(executorRelation);
                } catch (error) {
                    console.error(`Error creating executor relation: ${error.message}`);
                }
            }
        }

        // Create relations for files
        if (files.length > 0) {
            for (const fileId of files) {
                try {
                    const fileRelation = await client.request(
                        createItem(`${data.collection}_files`, {
                            [`${data.collection}_id`]: createdItem.id,
                            directus_files_id: fileId
                        })
                    );
                    results.relations.files.push(fileRelation);
                } catch (error) {
                    console.error(`Error creating file relation: ${error.message}`);
                }
            }
        }

        // Create relations for tasks (milestones)
        if (tasks.length > 0) {
            for (const taskId of tasks) {
                try {
                    // Ensure taskId is an integer
                    const taskIdInt = parseInt(taskId, 10);
                    if (isNaN(taskIdInt)) {
                        console.error(`Invalid task ID: ${taskId}`);
                        continue;
                    }
                    
                    const taskRelation = await client.request(
                        createItem(`${data.collection}_milestones`, {
                            [`${data.collection}_id`]: createdItem.id,
                            milestones_id: taskIdInt
                        })
                    );
                    results.relations.tasks.push(taskRelation);
                } catch (error) {
                    console.error(`Error creating task relation: ${error.message}`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Item created successfully',
            results
        });
    } catch (error) {
        console.error('Error in /create_item route:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/setup_permissions', express.json(), async (req, res) => {
    try {
        const client = createDirectus('http://localhost:2000').with(staticToken('Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq')).with(rest());

        const data = req.body;

        if (!data.collection) {
            return res.status(400).json({
                success: false,
                message: 'Error: collection is required'
            });
        }

        if (!data.role) {
            return res.status(400).json({
                success: false,
                message: 'Error: role is required'
            });
        }

        // Check if collection exists
        try {
            await client.request(readCollection(data.collection));
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: `Collection "${data.collection}" not found`,
                error: error.message
            });
        }

        // Get all related collections
        const relatedCollections = [
            data.collection,
            `${data.collection}_files`,
            `${data.collection}_directus_users`,
            `${data.collection}_contacts`,
            `${data.collection}_milestones`
        ];

        const permissionResults = [];

        // Set up permissions for each collection
        for (const collection of relatedCollections) {
            try {
                // Using a direct API call instead of createItem for permissions
                const actions = ['read', 'create', 'update', 'delete'];
                
                for (const action of actions) {
                    const response = await fetch('http://localhost:2000/items/directus_permissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer Kr1pTarg34oK9yHQIfAYVf9qJhAD0xjq`
                        },
                        body: JSON.stringify({
                            role: data.role,
                            collection: collection,
                            action: action,
                            fields: ['*'],
                            permissions: {},
                            validation: {}
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        permissionResults.push({ 
                            collection, 
                            action, 
                            status: 'success',
                            result
                        });
                    } else {
                        const errorText = await response.text();
                        permissionResults.push({ 
                            collection, 
                            action,
                            status: 'error', 
                            error: errorText
                        });
                    }
                }
            } catch (error) {
                permissionResults.push({ 
                    collection, 
                    status: 'error', 
                    error: error.message 
                });
                console.error(`Error setting up permissions for ${collection}:`, error);
                // Continue with other collections even if one fails
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Permissions set up successfully',
            results: permissionResults
        });
    } catch (error) {
        console.error('Error in /setup_permissions route:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

export default router;