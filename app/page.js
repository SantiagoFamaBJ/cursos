import { redirect } from 'next/navigation'

export default function Home() {
  redirect(`/panel/${process.env.NEXT_PUBLIC_SECRET_PANEL_PATH}`)
}
