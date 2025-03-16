# `/new_table`

Has a request body structure:

```typescript
    interface RequestData {
        status: int;
        created_by: string;
        created_at: Date;
        updated_by: string;
        updated_at: Date;
        tableName: string;
        transaction_amount: float;
        notes: string;
        contacts: int[];
        additional_points: string[];
        deal: string;
        tags: string[];
        tasks: int[];
        files: int[];
        executors: int[];
    }
```
