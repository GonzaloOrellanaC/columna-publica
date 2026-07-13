import React from "react";
import { AboutView } from "../components/AboutView";
import { Article } from "../types";

interface AboutProps {
  articles: Article[];
}

export const About: React.FC<AboutProps> = ({ articles }) => {
  return <AboutView users={[]} articles={articles} />;
};

export default About;
