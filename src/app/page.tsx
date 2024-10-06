import dynamic from 'next/dynamic';

const PhysarumSimulation = dynamic(
  () => import('@/components/Physarum/PhysarumSimulation'),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <PhysarumSimulation />
    </div>
  );
}
