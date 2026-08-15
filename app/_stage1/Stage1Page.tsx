type Stage1PageProps = {
  title: string;
  description: string;
};

export default function Stage1Page({
  title,
  description,
}: Stage1PageProps) {
  return (
    <section aria-labelledby="stage1-page-title">
      <p>Creative Journeys Travel PH</p>
      <h1 id="stage1-page-title">{title}</h1>
      <p>{description}</p>
    </section>
  );
}
