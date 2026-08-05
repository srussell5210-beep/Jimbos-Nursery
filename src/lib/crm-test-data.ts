import { cookies } from "next/headers";

export const CRM_TEST_DATA_COOKIE = "crm_test_data";

export function isCrmTestDataEnabled() {
  return cookies().get(CRM_TEST_DATA_COOKIE)?.value !== "off";
}
