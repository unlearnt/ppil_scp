import {createClient} from '@supabase/supabase-js'


export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: Request) {

    // @ts-ignore
    const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY)

    if (supabase) {

        const body = await request.json()

        console.log("Request ", body)
        console.log("corpId ", body.corpId)
        console.log("shirtSize ", body.shirtSize)

        void await supabase.rpc('decrement',
            {x: 1, selected_size: body.shirtSize.toUpperCase()})

        let {data, error} = await supabase
            .from('ppil_scp_shirt_collection')
            .update({collected: true, collected_size: body.shirtSize.toUpperCase()})
            .eq('corp_id', body.corpId)
            .select()

        console.log("update data ", data)
        console.log("update error ", error)

        // const name = formData.get('name')
        // const email = formData.get('email')

        // return Response.json({ name, email })

        let response = {
            'locker': 123,
            'pass': 456
        }
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
                'Pragma': 'no-cache', // HTTP 1.0
                'Expires': '0', // Proxies
            },
        })
    } else {
        return new Response('Unable to submit shirt ', {
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