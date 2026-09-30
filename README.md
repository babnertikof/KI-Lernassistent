V2 is a complete rewrite of the project to use Deno. It also implements a proper Database.

# Current Developments
I am currently working on building the Database and the API to acces that Database.
## Database
The Database uses the node:sql package to create and manage a sqlite database. The schema is defined in [schema.md](./service/database/schema.md).
## API
I am using oak/acorn for the api. It is a package to quickly build RESTful JSON APIs. It  ships with valibot which I already integrated.