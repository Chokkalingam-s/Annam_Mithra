import React from "react";
import Header from "../components/receiver/Header";
import SearchBar from "../components/receiver/SearchBar";
import Banner from "../components/receiver/Banner";
import QuoteBanner from "../components/receiver/QuoteBanner";
import ExploreSection from "../components/receiver/ExploreSection";
import FoodList from "../components/receiver/FoodList";
import BottomNav from "../components/receiver/BottomNav";

const ReceiverHome = () => {
  return (
    <div style={styles.container}>
      <Header />
      <SearchBar />
      <Banner />
      <QuoteBanner />
      <ExploreSection />
      <FoodList />
      <BottomNav />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    paddingBottom: "80px",
  },
};

export default ReceiverHome;
