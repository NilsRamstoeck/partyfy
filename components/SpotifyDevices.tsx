import { Certificate } from "crypto";
import { getAvailableDevices } from "lib/partyfy-client"
import { useEffect } from "react"

export function SpotifyDevices({token}:{token:string}){

    
    
    useEffect(() => {
        (async function(){
            const devices = await getAvailableDevices(token);

            if(devices.err){
                console.error(devices.err);
                return;
            }
            
            console.log(devices);

        })()
    })

    return (
        <div></div>
    )
}