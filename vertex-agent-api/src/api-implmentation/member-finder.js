import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
export default async ({ memberId }) => {
  // const { locationId, startDate } = params;
  try {
    const params = {};
    console.dir(params);
    const headers = { Accept: "application/json" };
    let API_URL =
      process.env.MEMBER_FINDER_DOMAIN + "/appointment/user/" + memberId;
    const response = await axios.get(API_URL, {
      params,
      headers,
    });
    console.log("find user response " + JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    // Error handling
    console.error(error.msg);
  }
};
