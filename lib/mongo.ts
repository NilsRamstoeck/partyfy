import { mongodb_user, mongodb_pass, mongodb_host, mongodb_port } from "config";
import { connect, connection, set } from "mongoose";

set('strictQuery', true);
export function connectToDatabase(){
    connect(`mongodb://${mongodb_user}:${mongodb_pass}@${mongodb_host}:${mongodb_port}`, {dbName:'partyfy'})
};

export function isConnectedToDatabase(){
    return connection.readyState == 1;
}

connectToDatabase();