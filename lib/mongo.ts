import { mongodb_user, mongodb_pass, mongodb_host, mongodb_port } from "config";
import { connect, set } from "mongoose";

set('strictQuery', true);
connect(`mongodb://${mongodb_user}:${mongodb_pass}@${mongodb_host}:${mongodb_port}`, {dbName:'partyfy'});