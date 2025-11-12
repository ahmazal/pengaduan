function Title({title, subTitle}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center pt-10">
        <h2 className="text-2xl font-bold text-amber-500">{title}</h2>
        <p className="text-sm">{subTitle}</p>
      </div>
    </>
  )
}

export default Title