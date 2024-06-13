import {getSupabaseClient} from "@/app/service/supabase/supabase";
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

    const supabase = getSupabaseClient();

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('corp-id')

    console.log("query ", query)

    if (supabase) {
        let queryParts = query.split('@');
        let queryBase = queryParts[0];

        let {data, error} = await supabase
            .from('ppil_scp_shirt_collection')
            .select('size, collected')
            .eq('corp_id', queryBase)
            // .or(`corp_id.ilike.${query}, corp_id.ilike.${query}@%`);


        console.log("data ", data)

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                'Pragma': 'no-cache', // HTTP 1.0
                'Expires': '0', // Proxies
            }
        })
    } else {
        return new Response("Error getting shirt size", {
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