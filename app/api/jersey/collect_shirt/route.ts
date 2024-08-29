import {getSupabaseClient} from "@/app/service/supabase/supabase";

export const dynamic = 'force-dynamic' // defaults to auto

async function get_locker(locker_no: String) {

    console.log("get locker no ", locker_no)
    const supabase = getSupabaseClient();

    if (supabase) {
        let {data, error} = await supabase
            .from('ppil_scp_lockers')
            .select('locker_pass')
            .eq('locker_no', locker_no)

        if (data) {
            const lockerPass = data[0].locker_pass;
            console.log("data ", lockerPass);
            console.log(`selected locker pass is: ${JSON.stringify(lockerPass)} and locker no is ${locker_no}`);

            return lockerPass;
        }

        return null
    }
    return null;
}

export async function POST(request: Request) {

    const supabase = getSupabaseClient();

    if (supabase) {

        const body = await request.json()

        console.log("Request ", body)
        console.log("corpId ", body.corpId)

        let query = body.corpId;
        const queryParts = query.split('@');

        if (queryParts.length > 1) {
            query = queryParts[0];
        }

        let {data, error} = await supabase
            .from('ppil_scp_jersey')
            .update({collected: true})
            .eq('corp_id', query)
            .select()

        if (data) {
            console.log("update data ", data)
            console.log("update error ", error)

            console.log("locker no ", data[0].locker_no)
            console.log("jersey name ", data[0].jersey_name)

            const locker = await get_locker(data[0].locker_no)

            console.log("locker ", locker)

            let response = {
                'locker': data[0].locker_no,
                'pass': locker,
                'jersey_name': data[0].jersey_name
            }
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                    'Pragma': 'no-cache', // HTTP 1.0
                    'Expires': '0', // Proxies
                }
            })
        }
    } else {
        return new Response('Unable to submit shirt ', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                'Pragma': 'no-cache', // HTTP 1.0
                'Expires': '0', // Proxies
            }
        })
    }
}