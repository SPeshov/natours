/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51GvQEbBaGR6bAj0oMxkK3UzSp7IGPgXAbA14UbP1r0ALiP977B5e1L7VDVzhbXOCxSRc9f0jvmOdSCZhYZr7GKQq00t4qHtXyZ'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
