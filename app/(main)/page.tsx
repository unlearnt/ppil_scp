import Header from "@/app/components/main/header";
// import CollectForm from "@/app/components/main/form";
import JerseyForm from "@/app/components/main/jersey_form";

export default function Home() {
    return (
        <main className="flex  flex-col ">
            <Header/>
            {/*<CollectForm/>*/}
            <JerseyForm/>
        </main>
    );
}