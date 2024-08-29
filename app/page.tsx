import ProductList from "@/components/Product/ProductList";

export default function Home() {
  return (
    <main className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div>
        <ProductList />
      </div>
    </main>
  );
}
