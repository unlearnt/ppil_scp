import {getSupabaseClient} from "@/app/service/supabase/supabase";

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: Request) {

    const supabase = getSupabaseClient();

    if (supabase) {

        const body = await request.json()

        console.log("Request ", body)
        console.log("corpId ", body.corpId)
        console.log("shirtSize ", body.shirtSize)

        const {data, error} = await
            supabase.rpc('decrement',
                {x: 1, selected_size: body.shirtSize.toUpperCase()})

        console.log("decrement data ", data)
        console.log("decrement error ", error)


        const {update_data, update_error} = await supabase
            .from('ppil_scp_shirt_collection')
            .update({collected: true, collected_size: body.shirtSize.toUpperCase()})
            .eq('corp_id', body.corpId)
            .select()

        console.log("update data ", update_data)
        console.log("update error ", update_error)

        // const name = formData.get('name')
        // const email = formData.get('email')

        // return Response.json({ name, email })

        let response = {
            'locker': 123,
            'pass': 456
        }
        return new Response(JSON.stringify(response), {
            status: 200,
        })
    } else {
        return new Response('Unable to submit shirt ', {
            status: 400,
        })
    }
}