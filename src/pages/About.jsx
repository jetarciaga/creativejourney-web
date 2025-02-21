import "./About.scss";
import testImage from "../assets/images/Rice-Terraces.jpg";

const About = () => {
  return (
    <section className="page-container">
      <h2>Our Purpose</h2>
      <section className="text-wrapper">
        <article>
          <h1>Your Gateway to the Best Worry-Free Travel Deals!</h1>
          <p>
            Creative Journeys Travel PH is a premier wholesaler travel agency
            based in the Philippines, boasting 8 years of expertise in crafting
            exceptional travel experiences. Specializing in FIT (Free
            Independent Traveler), GIT (Group Incentive Travel), and MICE
            (Meetings, Incentives, Conferences, and Events), we are committed to
            delivering tailored solutions that meet the diverse needs of our
            clients.
          </p>
        </article>
        <aside>
          <img src={testImage} alt="" style={{ width: "700px" }} />
        </aside>
      </section>
    </section>
  );
};

export default About;
