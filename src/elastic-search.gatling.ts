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
  StringBody,
  exec, // Import exec for chains
  ChainBuilder // Import ChainBuilder for type safety
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";

export default simulation((setUp) => {
  // const credentialsFeeder = csv("credentials_BETA.csv").random();

  const httpProtocol = http
    .baseUrl("https://beta.api.5ways.pl/rest/")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .inferHtmlResources();

  // Chain for getting the authentication token
  // const getToken: ChainBuilder = exec(
  //   http("GET TOKEN")
  //     .post("/token")
  //     .body(
  //       StringBody(
  //         `{
  //           "grant_type": "#{grant_type}",
  //           "client_id": "#{client_id}",
  //           "username": "#{username}",
  //           "password": "#{password}"
  //         }`
  //       )
  //     )
  //     .check(status().is(200))
  //     .check(jsonPath("$.access_token").saveAs("access_token"))
  // );

  const token = '8815dc88b557672b5da676d9091a73ddb5777c1d';
  // Chain for fetching "Moje sprawy"
  const getAllIssueWhichContaiWrod_PIT: ChainBuilder = exec(
    http("Obłsuwa spraw - PIT")
      .get(
        "issue/issue_sentence/?fields=Issue_id,Issue_issue_internal_id,Issue_subject,Issue_owner_id,Issue_status,Issue_priority,Issue_tags,Issue_answer_time,Issue_client_info,Issue_modified,Issue_corrected,Issue_issue_initiator_id,Issue_order_id,Issue_offer_send,Issue_archived,Issue_category_id,Issue_sentences_counter,ai_suggest,poll_id&Issue_status=open,new&search=pit&search_in=Issue_id,Issue_subject,IssueSentence_body&search_type=AND&Issue_owner_id=0&order=waiting_time|desc&page=1&limit=10"
      )
      .header("Authorization", `Bearer ${token}`)
      .check(status().is(200))
  );

  const getAllIssueWhichContaiWrod_PODATEK: ChainBuilder = exec(
    http("Obłsuwa spraw - Podatek")
      .get(
        "issue/issue_sentence/?fields=Issue_id,Issue_issue_internal_id,Issue_subject,Issue_owner_id,Issue_status,Issue_priority,Issue_tags,Issue_answer_time,Issue_client_info,Issue_modified,Issue_corrected,Issue_issue_initiator_id,Issue_order_id,Issue_offer_send,Issue_archived,Issue_category_id,Issue_sentences_counter,ai_suggest,poll_id&Issue_status=open,new&search=podatek&search_in=Issue_id,Issue_subject,IssueSentence_body&search_type=AND&Issue_owner_id=0&order=waiting_time|desc&page=1&limit=10"
      )
      .header("Authorization", `Bearer ${token}`)
      .check(status().is(200))
  );

  const getAllIssueWhichContaiWrod_VAT: ChainBuilder = exec(
    http("Obłsuwa spraw - VAT")
      .get(
        "issue/issue_sentence/?fields=Issue_id,Issue_issue_internal_id,Issue_subject,Issue_owner_id,Issue_status,Issue_priority,Issue_tags,Issue_answer_time,Issue_client_info,Issue_modified,Issue_corrected,Issue_issue_initiator_id,Issue_order_id,Issue_offer_send,Issue_archived,Issue_category_id,Issue_sentences_counter,ai_suggest,poll_id&Issue_status=open,new&search=vat&search_in=Issue_id,Issue_subject,IssueSentence_body&search_type=AND&Issue_owner_id=0&order=waiting_time|desc&page=1&limit=10"
      )
      .header("Authorization", `Bearer ${token}`)
      .check(status().is(200))
  );

  // Main scenario combining the chains
  const scn = scenario("Elastic Search Test")
    // .feed(credentialsFeeder)
    // .exec(getToken) // Execute the token chain
    .exec(getAllIssueWhichContaiWrod_PIT) // Execute the "Moje sprawy" chain
    .exec(getAllIssueWhichContaiWrod_PODATEK) // Execute the "Moje sprawy" chain
    .exec(getAllIssueWhichContaiWrod_VAT); // Execute the "Moje sprawy" chain

  setUp(
    scn.injectOpen(
      nothingFor(4), // 1
      atOnceUsers(10), // 2
      rampUsers(10).during(5), // 3
      constantUsersPerSec(20).during(15), // 4
      // constantUsersPerSec(20).during(15).randomized(), // 5
      // rampUsersPerSec(10).to(20).during(10), // 6
      // rampUsersPerSec(10).to(20).during(10).randomized(), // 7
      // stressPeakUsers(1000).during(20) // 8
    )
  ).protocols(httpProtocol);
});
