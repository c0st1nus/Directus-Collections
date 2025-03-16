import express from 'express';
import { createDirectus, staticToken, rest, deleteCollection, createCollection, readCollections } from '@directus/sdk';
import fs from 'fs';

const router = express.Router();

router.post('/test', express.json(), async (req, res) => {
    const client = createDirectus('http://localhost:2000').with(staticToken('sOOosdF0WMdlh9ilp30kKoufBP4TgWx-')).with(rest());
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
    const client = createDirectus('http://localhost:2000').with(staticToken('sOOosdF0WMdlh9ilp30kKoufBP4TgWx-')).with(rest());
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
    const client = createDirectus('http://localhost:2000').with(staticToken('sOOosdF0WMdlh9ilp30kKoufBP4TgWx-')).with(rest());

    const data = req.body;

    const coll_list = await client.request(
        readCollections()
    );

    let tables = [];
    for(let i = 0; i < coll_list.length; i++) {
        tables.push(coll_list[i].collection);
    }

    if (tables.includes(`p_${data.header}`)) {
        res.status(400).send('Table already exists');
    }
    // const requestData = {
    //     status: data.status,
    //     created_by: data.created_by,
    //     created_at: data.created_at,
    //     updated_by: data.updated_by,
    //     updated_at: data.updated_at,
    //     header: data.header,
    //     transaction_amount: data.transaction_amount,
    //     notes: data.notes,
    //     contacts: data.contacts,
    //     additional_points: data.additional_points,
    //     deal: data.deal,
    //     tags: data.tags,
    //     tasks: data.tasks,
    //     files: data.files,
    //     executors: data.executors
    // };
    if (!data.header) {
        res.status(400).send('Error');
    }
    const main_table = {
        "collection": "p_${data.header}",
        "meta": {
            "collection": "p_${data.header}",
            "icon": "assignment",
            "note": null,
            "display_template": "{{ header }}",
            "hidden": false,
            "singleton": false,
            "translations": null,
            "archive_field": null,
            "archive_value": null,
            "unarchive_value": null,
            "archive_app_filter": true,
            "sort_field": null,
            "item_duplication_fields": null,
            "sort": 1,
            "accountability": "all",
            "group": "projects",
            "collapse": "open",
            "preview_url": null,
            "versioning": false
        },
        "schema": {
            "name": "projects",
            "comment": null
        },
        "fields": [
            {
                "field": "id",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_primary_key": true,
                    "is_nullable": false,
                    "max_length": 36
                }
            },
            {
                "field": "created_by",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 36
                }
            },
            {
                "field": "created_at",
                "type": "datetime",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "updated_by",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 36
                }
            },
            {
                "field": "updated_at",
                "type": "datetime",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "header",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 255
                }
            },
            {
                "field": "additional_points",
                "type": "json",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "notes",
                "type": "text",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "deal",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 36
                }
            },
            {
                "field": "transaction_amount",
                "type": "float",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "tags",
                "type": "json",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            },
            {
                "field": "status",
                "type": "integer",
                "meta": {},
                "schema": {
                    "is_nullable": true
                }
            }
        ]
    }

    const main_result = await client.request(
        createCollection(main_table)
    );

    console.log(main_result);

    const files_table = {
        "collection": "p_${data.header}_files",
        "meta": {
            "collection": "p_${data.header}_files",
            "icon": "import_export",
            "note": null,
            "display_template": null,
            "hidden": true,
            "singleton": false,
            "translations": null,
            "archive_field": null,
            "archive_value": null,
            "unarchive_value": null,
            "archive_app_filter": true,
            "sort_field": null,
            "item_duplication_fields": null,
            "sort": 2,
            "group": "p_${data.header}",
            "collapse": "open",
            "accountability": "all",
            "color": null,
            "preview_url": null,
            "versioning": false
        },
        "schema": {
            "name": "p_${data.header}_files",
            "comment": null
        },
        "fields": [
            {
                "field": "id",
                "type": "integer",
                "meta": {},
                "schema": {
                    "is_primary_key": true,
                    "is_nullable": false
                }
            },
            {
                "field": "projects_id",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 36
                }
            },
            {
                "field": "directus_files_id",
                "type": "string",
                "meta": {},
                "schema": {
                    "is_nullable": true,
                    "max_length": 36
                }
            }
        ]
    };
    
    const files_result = await client.request(
        createCollection(files_table)
    );

    const users_table = {
        "collection": "p_${data.header}_directus_users",
        "meta": {
          "collection": "p_${data.header}_directus_users",
          "icon": "import_export",
          "note": null,
          "display_template": null,
          "hidden": true,
          "singleton": false,
          "translations": null,
          "archive_field": null,
          "archive_app_filter": true,
          "archive_value": null,
          "unarchive_value": null,
          "sort_field": null,
          "accountability": "all",
          "color": null,
          "item_duplication_fields": null,
          "sort": 3,
          "group": "p_${data.header}",
          "collapse": "open",
          "preview_url": null,
          "versioning": false
        },
        "schema": {
          "name": "projects_directus_users",
          "sql": "CREATE TABLE \"projects_directus_users\" (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `projects_id` char(36) NULL, `directus_users_id` char(36) NULL, CONSTRAINT `projects_directus_users_directus_users_id_foreign` FOREIGN KEY (`directus_users_id`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL, CONSTRAINT `projects_directus_users_projects_id_foreign` FOREIGN KEY (`projects_id`) REFERENCES `p_${data.header}` (`id`) ON DELETE SET NULL)"
        }
    };

    const users_result = await client.request(
        createCollection(users_table)
    );

    const contacts_table = {
        "collection": "p_${data.header}_contacts",
        "meta": {
          "collection": "p_${data.header}_contacts",
          "icon": "import_export",
          "note": null,
          "display_template": null,
          "hidden": true,
          "singleton": false,
          "translations": null,
          "archive_field": null,
          "archive_app_filter": true,
          "archive_value": null,
          "unarchive_value": null,
          "sort_field": null,
          "accountability": "all",
          "color": null,
          "item_duplication_fields": null,
          "sort": 4,
          "group": "p_${data.header}",
          "collapse": "open",
          "preview_url": null,
          "versioning": false
        },
        "schema": {
          "name": "projects_contacts",
          "sql": "CREATE TABLE \"projects_contacts\" (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `projects_id` char(36) NULL, `contacts_id` char(36) NULL, CONSTRAINT `projects_contacts_contacts_id_foreign` FOREIGN KEY (`contacts_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL, CONSTRAINT `projects_contacts_projects_id_foreign` FOREIGN KEY (`projects_id`) REFERENCES `p_${data.header}` (`id`) ON DELETE SET NULL)"
        }
    };
    
    const contacts_result = await client.request(
        createCollection(contacts_table)
    );


    const task_table = {
        "collection": "p_${data.header}_milestones",
        "meta": {
          "collection": "p_${data.header}_milestones",
          "icon": "import_export",
          "note": null,
          "display_template": null,
          "hidden": true,
          "singleton": false,
          "translations": null,
          "archive_field": null,
          "archive_app_filter": true,
          "archive_value": null,
          "unarchive_value": null,
          "sort_field": null,
          "accountability": "all",
          "color": null,
          "item_duplication_fields": null,
          "sort": 5,
          "group": "p_${data.header}",
          "collapse": "open",
          "preview_url": null,
          "versioning": false
        },
        "schema": {
          "name": "projects_milestones",
          "sql": "CREATE TABLE \"projects_milestones\" (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `projects_id` char(36) NULL, `milestones_id` integer NULL, CONSTRAINT `projects_milestones_milestones_id_foreign` FOREIGN KEY (`milestones_id`) REFERENCES `milestones` (`id`) ON DELETE SET NULL, CONSTRAINT `projects_milestones_projects_id_foreign` FOREIGN KEY (`projects_id`) REFERENCES `p_${data.header}` (`id`) ON DELETE SET NULL)"
        }
    };

    const task_result = await client.request(
        createCollection(task_table)
    );

    if (main_result && files_result && users_result && contacts_result && task_result) {
        res.status(200).send('Tables created');
    }
    else {
        res.status(400).send('Error');
    }
});


export default router;