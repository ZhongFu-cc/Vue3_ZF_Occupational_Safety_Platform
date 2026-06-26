import request from "@/utils/request";
import { Heartbeat } from "./type";
const BASE_URL = "/chapter-watch-log";

export function heartbeatApi(data: Heartbeat) {
  return request({
    url: `${BASE_URL}/heartbeat`,
    method: "POST",
    data,
  });
}

export function endWatchApi(data: Heartbeat) {
  return request({
    url: `${BASE_URL}/end`,
    method: "POST",
    data,
  });
}