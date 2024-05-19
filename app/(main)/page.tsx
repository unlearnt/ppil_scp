import Header from "@/app/components/main/header";
import CollectForm from "@/app/components/main/form";

export default function Home() {
    return (
        <main className="flex  flex-col ">
            <Header/>
            <CollectForm/>
        </main>
    );
}