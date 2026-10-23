import { restaurant } from "@/config/restaurant";
import LegalPage from "@/components/ui/LegalPage";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="Draft">
      <p>These terms cover the use of the {restaurant.name} website and its online reservation form.</p>
      <h2>Reservations</h2>
      <p>A reservation is confirmed once you see the confirmation page. Please present your confirmation or reference at reception. To change or cancel a booking, contact the restaurant.</p>
      <h2>Accuracy of information</h2>
      <p>Please provide accurate contact details so we can reach you about your booking.</p>
      <h2>Contact</h2>
      <p>Questions? Call {restaurant.phone.display} or email <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>.</p>
    </LegalPage>
  );
}
