import "./About.scss";
import teamImage from "../assets/images/team.jpg";
import teamImageWebp from "../assets/images/team.webp";
import underwater from "../assets/images/underwater.jpg";
import underwaterWebp from "../assets/images/underwater.webp";
import tarsier from "../assets/images/tarsier.jpg";
import tarsierWebp from "../assets/images/tarsier.webp";

const About = () => {
  return (
    <section className="about-container">
      <div className="about-wrapper">
        <article className="about-us">
          <header>
            <h1>Your Gateway to the Best Worry-Free Travel Deals!</h1>
          </header>
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

        <figure className="image-container">
          <picture>
            <source srcSet={teamImageWebp} type="image/webp" />
            <img src={teamImage} alt="CreativeJourneys Team" />
          </picture>
          <figcaption>Meet the CreativeJourneys PH Team</figcaption>
        </figure>
      </div>
      <p>
        Our extensive experience and deep understanding of the travel industry
        allow us to offer unparalleled service and insights, ensuring every
        journey is memorable and seamless. We pride ourselves on our attention
        to detail, personalized service, and the ability to handle complex
        travel arrangements with ease.
      </p>
      <section className="company-profile">
        <article className="mission">
          <div className="text-content">
            <header>
              <h2>Our Mission</h2>
            </header>
            <p>
              At Creative Journeys PH, our mission is to transform travel dreams
              into reality by providing exceptional, personalized travel
              solutions. We are dedicated to delivering memorable experiences
              through our expertise, commitment to excellence, and passion for
              travel.
            </p>
          </div>
          <figure className="img-crop">
            <picture>
              <source srcSet={underwaterWebp} type="image/webp" />
              <img src={underwater} alt="" loading="lazy" />
            </picture>
            <figcaption>Underwater adventure with turtle</figcaption>
          </figure>
        </article>
        <article className="vision">
          <div className="text-content">
            <header>
              <h2>Our Vision</h2>
            </header>
            <p>
              To be one of the leading destination management company in the
              Philippines, known for our innovative solutions, exceptional
              service, and unwavering dedication to exceeding client
              expectations.
            </p>
          </div>
          <figure className="img-crop">
            <picture>
              <source srcSet={tarsierWebp} type="image/webp" />
              <img src={tarsier} alt="" loading="lazy" />
            </picture>
            <figcaption>Tarsier from Philippines</figcaption>
          </figure>
        </article>
      </section>
    </section>
  );
};

export default About;
