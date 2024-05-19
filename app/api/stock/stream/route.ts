import {NextRequest, NextResponse} from 'next/server';
import {getSupabaseClient} from "@/app/service/supabase/supabase";
import {RealtimeChannel} from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const supabase = getSupabaseClient();

    const handleInserts = (payload: any) => {
        console.log('Change received!', payload);
        writer.write(encoder.encode(`data: ${JSON.stringify(payload.new)}\n\n`));
    };

    let subscription: RealtimeChannel;

    if (supabase) {
        subscription = supabase
            .channel('public:ppil_scp_shirt')
            .on(
                'postgres_changes',
                {event: 'UPDATE', schema: 'public', table: 'ppil_scp_shirt'},
                handleInserts
            )
            .subscribe();
    }

    req.signal.onabort = () => {
        console.log('Client disconnected');
        if (supabase) {
            subscription.unsubscribe();
        }
        writer.close();
    };

    return new NextResponse(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
