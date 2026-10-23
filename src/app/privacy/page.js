import { restaurant } from "@/config/restaurant";
import LegalPage from "@/components/ui/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Draft">
      <p>This page explains what {restaurant.name} collects when you make a reservation on this website.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Your name, email address and phone number.</li>
        <li>Your reservation details: date, time and number of guests.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To hold your table and let our team find your booking when you arrive.</li>
        <li>To email you a confirmation of your reservation.</li>
      </ul>
      <h2>Who processes it</h2>
      <p>Reservation data is stored in our database, and confirmation emails are delivered through an email service provider.</p>
      <h2>Contact</h2>
      <p>For questions or requests about your data, email <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>.</p>
    </LegalPage>
  );
}
