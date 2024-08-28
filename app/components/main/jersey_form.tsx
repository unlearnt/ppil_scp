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

export default function JerseyForm() {

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

        const res = await fetch('/api/jersey/collect_shirt', {
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

            const response = await fetch(`/api/jersey/check_collection?corp-id=${value.toLowerCase()}`);
            const collection: [Collection] = await response.json()

            if (requestId !== currentRequest.current) {
                // Ignore outdated responses
                return;
            }

            if (collection.length > 0) {
                console.log("collection ", collection)
                setValid(true)
            } else {
                setError("We couldn't locate your record in our system. It seems you haven't registered for the shirt yet.")
            }
        }
    }

    const checkButton = () => {
        return !valid;
    }

    return (
        <form className="flex-col px-4 py-1 overflow-auto" onSubmit={handleSubmit}>
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
        </form>
    )
}