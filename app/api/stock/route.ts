import {getSupabaseClient} from "@/app/service/supabase/supabase";

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {

    const supabase = getSupabaseClient();

    if (supabase) {
        let {data, error} = await supabase
            .from('ppil_scp_shirt')
            .select('*')
            .order('id', { ascending: true })


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