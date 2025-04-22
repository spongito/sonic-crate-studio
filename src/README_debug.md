
# Debugging Supabase Queries

## Query Explain Plans

To help debug performance issues with Supabase queries, you can enable query explain plans which show how PostgreSQL is executing your queries. This is a powerful debugging tool but should only be used in development environments.

### How to Enable Query Explain Plans

1. Set the environment variable `DEBUG_SUPABASE_PLAN=true`
2. Make sure you're in a non-production environment (`NODE_ENV !== 'production'`)

### How It Works

When both conditions are met, the application will:

1. Execute the normal query with an additional `.explain({ analyze: true })` call
2. Log the execution plan to the console
3. Continue with the regular query execution

### Important Notes

- **NEVER** enable this in production as it can significantly impact performance
- The explain plan function changes the `Accept` header to `application/vnd.pgrst.plan+text` which can cause issues if not handled properly
- Query plans contain sensitive information about your database structure

### Troubleshooting Header Issues

If you see errors like:

```
None of these media types are available:
application/vnd.pgrst.plan+text; for="application/json"; options=analyze
```

It means the `.explain()` function was called but the response handling isn't set up correctly. Make sure:

1. You're only calling `.explain()` in development mode
2. You're checking the environment variable before using it
3. You have proper error handling to catch and display these issues

### Performance Considerations

Running explain plans can be resource-intensive, especially with `analyze=true` which actually executes the query. Only use this when actively debugging performance issues.
