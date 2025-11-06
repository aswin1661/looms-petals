import Carousels from "./components/Carousel";
import Section from "./components/section";
import Trend from "./components/trend";
import Price from "./components/price";
import CardSection from "./components/cardSection";
import ScrollTrend from "./components/scrollTrend";


export default function Home() {
  return (
    <div className="home w-screen">
      <Carousels />
      <Price />
      <CardSection />
      <Trend />
      <ScrollTrend />
      <Section />
    </div>
  );
}
