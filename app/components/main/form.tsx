"use client"
import React, {useEffect, useRef, useState} from "react";
import Modal from "@/app/components/main/modal";

type SizeOption = {
    size: string;
    measurement: string;
    quantity: number;
};

type Collection = {
    size: string;
    collected: boolean;
}

// const sizes: SizeOption[] = [
//     {value: 'XS', measurement: "33-34cm", quantity: 0},
//     {value: 'S', measurement: "35-37cm", quantity: 5},
//     {value: 'M', measurement: "36-40cm", quantity: 2},
//     {value: 'L', measurement: "41-43cm", quantity: 5},
//     {value: 'XL', measurement: "44-46cm", quantity: 7},
//     {value: '2XL', measurement: "47-49cm", quantity: 8},
//     {value: '3XL', measurement: "50-53cm", quantity: 3},
//     {value: '4XL', measurement: "54-57cm", quantity: 4},
// ];
export default function CollectForm() {

    const [shirtSize, setShirtSize] = useState('');
    const [checked, setChecked] = useState(false);
    const [sizes, setSizes] = useState<SizeOption[]>([]);
    const [error, setError] = useState<String>('');
    const [valid, setValid] = useState<boolean>(false)
    const [open, setOpen] = useState(false)

    const [locker, setLocker] = useState("abc");
    const [pass, setPass] = useState("123");

    const currentRequest = useRef(0);
    // const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        const getShirtSizes = async () => {
            try {
                const response = await fetch('/api/stock');
                if (!response.ok) {
                    throw new Error('get stock response failed');
                }
                const data: SizeOption[] = await response.json();
                setSizes(data);
            } catch (error) {
                console.error('Error fetching shirt sizes:', error);
            }
        };
        void getShirtSizes();
    }, []);

    useEffect(() => {
        const eventSource = new EventSource('/api/stock/stream');

        eventSource.onmessage = (event) => {
            const update = JSON.parse(event.data);
            console.log("update ", update.quantity)

            setSizes((prevSizes) =>
                prevSizes.map((size) =>
                    size.size === update.size
                        ? {...size, quantity: update.quantity}
                        : size
                )
            );

        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        console.log("formData ", formData)
        const corpId = formData.get('corpId'); // Get email from FormData
        console.log('Submitted Email:', corpId);
        console.log('Selected Shirt Size:', shirtSize);
        console.log("checked ", checked)

        let body = {
            corpId: corpId,
            shirtSize: shirtSize
        }

        const res = await fetch('/api/collect_shirt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            setError('unable to submit for shirt collection')
            throw new Error('unable to submit for shirt collection');
        }

        let {locker, pass} = await res.json();

        setLocker(locker);
        setPass(pass);
        setOpen(true);
        setValid(false);
    };

    const onTextChange = async (event: React.FormEvent) => {

        setError('');
        if (valid) setValid(false);

        const element = event.currentTarget as HTMLInputElement
        const value = element.value

        console.log("change event ", value)

        if (value.length >= 4) {
            console.log("check corp id")
            const requestId = ++currentRequest.current;

            // if (abortController.current) {
            //     abortController.current.abort();
            // }
            // abortController.current = new AbortController();
            // const signal = abortController.current.signal;
            // console.log("check corp id");

            const response = await fetch(`/api/check_collection?corp-id=${value.toLowerCase()}`);
            const collection: [Collection] = await response.json()

            if (requestId !== currentRequest.current) {
                // Ignore outdated responses
                return;
            }


            if (collection.length > 0) {
                console.log("collection ", collection)
                setValid(true)

                if (!collection[0].collected) { // not collected
                    console.log("collection ", collection[0].size)
                    const foundItem = sizes.find(item => item.size === collection[0].size);
                    if (foundItem && foundItem.quantity > 0) setShirtSize(collection[0].size);
                } else { // collected
                    // setError("You have already collected your shirt")
                }
            } else {
                setError("We couldn't locate your record in our system. It seems you haven't registered for the shirt yet.")
            }
        }
    }

    const checkButton = () => {

        if ( !shirtSize || error.length > 0 || !valid) return true
        if (shirtSize) {
            const foundItem =
                sizes.find(item => item.size === shirtSize);
            if (foundItem && foundItem.quantity <= 0) return true
        }

        return false
    }
    return (
        sizes.length > 0 ? <form className="flex-col px-4 py-1 overflow-auto" onSubmit={handleSubmit}>
            <div className="mb-4">
                <Modal open={open} setOpen={setOpen} locker={locker} pass={pass}/>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Corp ID
                </label>
                <div className="mt-2">
                    <input
                        required={true}
                        onChange={(event) => onTextChange(event)}
                        name="corpId"
                        id="corpId"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Enter your Corp ID "
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {sizes.map((size) => (
                    <div
                        key={size.size}
                        className={`relative flex items-center space-x-3 rounded-lg border px-6 py-5 shadow-sm ${
                            size.quantity > 0
                                ? 'border-gray-300 bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        } ${
                            size.size === shirtSize ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => size.quantity > 0 && setShirtSize(size.size)}
                    >
                        <div className="min-w-0 flex-1">
                            <a href="#" className="focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true"/>
                                <p className="text-sm font-medium text-gray-900">{size.size}</p>
                                {/*<p className="truncate text-xs text-gray-500">{size.measurement}</p>*/}
                                <p className="truncate text-xs text-gray-500">Quantity: {size.quantity}</p>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/*<ul role="list" className="space-y-3 py-4">*/}
            {/*    <li className="overflow-hidden rounded-md bg-white px-6 py-4 shadow">*/}
            {/*        <fieldset>*/}
            {/*            <div className="space-y-5">*/}
            {/*                <div className="relative flex items-start">*/}
            {/*                    <div className="flex h-6 items-center">*/}
            {/*                        <input*/}
            {/*                            id="comments"*/}
            {/*                            aria-describedby="comments-description"*/}
            {/*                            name="comments"*/}
            {/*                            type="checkbox"*/}
            {/*                            onClick={(event) => setChecked(event.currentTarget.checked)}*/}
            {/*                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                    <div className="ml-3 text-sm leading-6">*/}
            {/*                        <label htmlFor="comments" className="font-medium text-gray-900">*/}
            {/*                            Placeholder*/}
            {/*                        </label>*/}
            {/*                        <p id="comments-description" className="text-gray-500">*/}
            {/*                            Placeholder Placeholder Placeholder*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </fieldset>*/}
            {/*    </li>*/}
            {/*</ul>*/}

            {error && <div className="text-red-600 bg-red-100 p-4 rounded mt-2">
                {error}
            </div>}

            <button
                // disabled={!checked || !shirtSize || error.length > 0 || !valid}
                disabled={checkButton()}
                type="submit"
                className="mt-2 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Submit
            </button>
        </form> : <div>Loading</div>
    )
}