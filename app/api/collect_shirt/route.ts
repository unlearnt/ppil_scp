import {getSupabaseClient} from "@/app/service/supabase/supabase";

export const dynamic = 'force-dynamic' // defaults to auto

async function get_locker(shirt_size: String){

    console.log("get locker selected shirt size ", shirt_size)

    let map = new Map();

    map.set("XS", {
        quantity : 10,
        lockers : [
            { locker_no : "11-0247", locker_password: "1590"},
        ]
    })

    map.set("S", {
        quantity : 50,
        lockers : [
            { locker_no : "11-0246", locker_password: "5000"},
        ]
    })

    map.set("M", {
        quantity : 46,
        lockers : [
            { locker_no : "11-0248", locker_password: "2370"},
            { locker_no : "11-0250", locker_password: "4100"}
        ]
    })

    map.set("L", {
        quantity : 70,
        lockers : [
            { locker_no : "11-0251", locker_password: "4472"},
            { locker_no : "11-0245", locker_password: "8600"}
        ]
    })

    map.set("XL", {
        quantity : 50,
        lockers : [
            { locker_no : "11-0244", locker_password: "9296"},
        ]
    })

    map.set("2XL", {
        quantity : 16,
        lockers : [
            { locker_no : "11-0243", locker_password: "9009"},
        ]
    })

    map.set("3XL", {
        quantity : 6,
        lockers : [
            { locker_no : "11-0242", locker_password: "7522"},
        ]
    })

    map.set("4XL", {
        quantity : 3,
        lockers : [
            { locker_no : "11-0241", locker_password: "6563"},
        ]
    })

    const supabase = getSupabaseClient();

    if (supabase) {
        let {data, error} = await supabase
            .from('ppil_scp_shirt')
            .select('quantity')
            .eq('size', shirt_size)

        if (data) {
            const selectedSizeQuantity = data[0].quantity;
            console.log("data ", selectedSizeQuantity);
            console.log(`selected shirt size is: ${JSON.stringify(shirt_size)} and stock level is ${selectedSizeQuantity}`);

            const mapEntry = map.get(shirt_size);
            if (mapEntry) {
                let selectedLocker;
                if (mapEntry.lockers.length > 1) {
                    const lockerIndex = selectedSizeQuantity / mapEntry.quantity < 1 ? 0 : 1;
                    selectedLocker = mapEntry.lockers[lockerIndex];
                } else {
                    selectedLocker = mapEntry.lockers[0];
                }
                console.log(`Assigned locker is: ${selectedLocker.locker_no}, password: ${selectedLocker.locker_password}`);
                return selectedLocker;
            } else {
                console.log("No entry found in map for the selected shirt size.");
                return null;
            }
        }
    }
    return null;
}
export async function POST(request: Request) {

    const supabase = getSupabaseClient();

    if (supabase) {

        const body = await request.json()

        console.log("Request ", body)
        console.log("corpId ", body.corpId)
        console.log("shirtSize ", body.shirtSize)

        const { data, error } = await  supabase.rpc('decrement_and_update_collection',
            {p_corp_id: body.corpId.toLowerCase(), p_size: body.shirtSize.toUpperCase(), p_quantity: 1})

        // let {data, error} = await supabase
        //     .from('ppil_scp_shirt_collection')
        //     .update({collected: true, collected_size: body.shirtSize.toUpperCase()})
        //     .eq('corp_id', body.corpId)
        //     .select()

        console.log("update data ", data)
        console.log("update error ", error)

        // const name = formData.get('name')
        // const email = formData.get('email')

        // return Response.json({ name, email })

        const locker = await get_locker(body.shirtSize)

        console.log("locker ", locker)

        let response = {
            'locker': locker.locker_no,
            'pass': locker.locker_password
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