import {
  atOnceUsers,
  constantUsersPerSec,
  csv,
  feed,
  jsonPath,
  nothingFor,
  rampUsers,
  rampUsersPerSec,
  scenario,
  simulation,
  stressPeakUsers,
  StringBody
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

export default simulation((setUp) => {
  const credentialsFeeder = csv("credentials_BETA.csv").random();

  const httpProtocol = http
    .baseUrl("https://beta.api.5ways.pl/rest/")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .inferHtmlResources();

  const scn = scenario("test")
    .feed(credentialsFeeder)
    .exec(
      http("GET TOKEN")
        .post("/token")
        .body(
          StringBody(
            JSON.stringify({
              grant_type: "#{grant_type}",
              client_id: "#{client_id}",
              username: "#{username}",
              password: "#{password}"
            })
          )
        )
        .check(status().is(200))
        .check(jsonPath("$.access_token").saveAs("access_token"))
    )
    .exec(
      http("Moje sprawy")
        .get(
          "/issue/issue_sentence/?fields=Issue_id,Issue_issue_internal_id,Issue_subject,Issue_owner_id,Issue_status,Issue_priority,Issue_tags,Issue_answer_time,Issue_client_info,Issue_modified,Issue_corrected,Issue_issue_initiator_id,Issue_order_id,Issue_offer_send,Issue_archived,Issue_category_id,ai_suggest,poll_id&Issue_status=open,new,unaccepted&Issue_owner_id=52361&order=issue_internal_id|desc&page=1&limit=5"
        )
        .header("Authorization", "Bearer #{access_token}")
        .check(status().is(200))
    );

  setUp(
    scn.injectOpen(
      nothingFor(4), // 1
      atOnceUsers(10), // 2
      rampUsers(10).during(5) // 3
      // constantUsersPerSec(20).during(15), // 4
      // constantUsersPerSec(20).during(15).randomized(), // 5
      // rampUsersPerSec(10).to(20).during(10), // 6
      // rampUsersPerSec(10).to(20).during(10).randomized(), // 7
      // stressPeakUsers(1000).during(20) // 8
    )
  ).protocols(httpProtocol);
});
