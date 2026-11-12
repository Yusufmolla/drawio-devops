import { registerComponent } from "@utils/knockout";
import template from "./message.html?raw";
import { message } from "./service.js";
import "./message.scss";

registerComponent("my-message", message, template);