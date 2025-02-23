import "./About.scss";
import teamImage from "../assets/images/team.jpg";
import underwater from "../assets/images/underwater.jpg";

const About = () => {
  return (
    <section className="page-container">
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
          <div className="image-container">
            <img src={teamImage} alt="CreativeJourneys Team" />
          </div>
        </aside>
      </section>
      <p>
        Our extensive experience and deep understanding of the travel industry
        allow us to offer unparalleled service and insights, ensuring every
        journey is memorable and seamless. We pride ourselves on our attention
        to detail, personalized service, and the ability to handle complex
        travel arrangements with ease.
      </p>
      <section className="mission">
        <section className="text-section">
          <h2>Our Mission</h2>
          <p>
            At Creative Journeys PH, our mission is to transform travel dreams
            into reality by providing exceptional, personalized travel
            solutions. We are dedicated to delivering memorable experiences
            through our expertise, commitment to excellence, and passion for
            travel.
          </p>
        </section>
        <section className="img-section">
          <div className="mission-img">
            <img src={underwater} alt="" />
          </div>
        </section>
      </section>
    </section>
  );
};

export default About;
