import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export default async ({
  memberId,
  firstName,
  lastName,
  email,
  appointmentId,
}) => {
  // const { locationId, startDate } = params;
  try {
    const payload = {
      memberId: memberId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      appointmentId: appointmentId,
    };
    console.dir(payload);

    let API_URL = process.env.MEMBER_FINDER_DOMAIN + "/appointment/confirm";
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    // Error handling
    console.error(error.msg);
  }
};
