import {getSupabaseClient} from "@/app/service/supabase/supabase";
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {

    const supabase = getSupabaseClient();

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
        })
    } else {
        return new Response("Error getting shirt size", {
            status: 400,
        })
    }

}