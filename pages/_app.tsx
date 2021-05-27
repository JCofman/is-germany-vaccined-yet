import 'tailwindcss/tailwind.css'

const MyApp = ({
  Component,
  pageProps,
}: Record<string, any>): React.ReactNode => {
  return <Component {...pageProps} />
}

export default MyApp
