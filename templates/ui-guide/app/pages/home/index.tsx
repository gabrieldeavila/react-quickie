import { Button } from "@/ui/components/primitives/button";
import { memo } from "react";

const Home = memo(() => {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="transparent">Transparent</Button>
        <Button variant="destructive">Destructive</Button>
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
});

export default Home;
