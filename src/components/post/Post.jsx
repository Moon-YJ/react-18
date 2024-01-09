import useGetData from "../../useGetData";

export default function Post() {
  const data = useGetData("https://jsonplaceholder.typicode.com/posts");
  console.log(data);

  return (
    <section className="Post">
      {data &&
        data.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </article>
        ))}
    </section>
  );
}
