function Title({title, subTitle}) {
  return (
    <>
      <div data-aos="zoom-in" className="flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-amber-500">{title}</h2>
        <p className="text-sm">{subTitle}</p>
      </div>
    </>
  )
}

export default Title