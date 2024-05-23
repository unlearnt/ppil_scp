// import {getSupabaseClient} from "@/app/service/supabase/supabase";
import {type NextRequest} from 'next/server'
import {createClient} from "@supabase/supabase-js";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

    // @ts-ignore
    const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY);

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('corp-id')

    console.log("query ", query)

    if (supabase) {
        let {data, error} = await supabase
            .from('ppil_scp_shirt_collection')
            .select('size, collected')
            .eq('corp_id', query)

        console.log("data ", data)

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                'Pragma': 'no-cache', // HTTP 1.0
                'Expires': '0', // Proxies
            },
        })
    } else {
        return new Response("Error getting shirt size", {
            status: 400,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                'Pragma': 'no-cache', // HTTP 1.0
                'Expires': '0', // Proxies
            },
        })
    }

}

