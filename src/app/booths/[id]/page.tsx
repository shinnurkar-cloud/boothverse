import { BoothSelector } from "@/components/booth/booth-selector";

// This is a server component that can fetch data and pass it to client components.
// For this mock app, we're not fetching, just setting up the structure.
// In a real app, you would fetch booth data based on the `params.id`.

export default function BoothPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <BoothSelector boothId={params.id} />
    </div>
  );
}
