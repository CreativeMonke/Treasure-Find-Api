import { HfInference } from "@huggingface/inference";
import { HUGGING_FACE_TOKEN } from "../../config/index.js";

export async function evaluateResponse(userResponse, correctResponses) {
    const hf = new HfInference(HUGGING_FACE_TOKEN);
    try {
        const modelId = "BAAI/bge-m3";
        const queryData = {
            source_sentence: userResponse,
            sentences: correctResponses

        };
        let res = await hf.sentenceSimilarity({
            model: modelId,
            inputs: queryData,
        })
        const roundedRes = res.map((value) => Math.round(value *100));
        const evaluation = Math.max(...roundedRes);
        return evaluation;
    } catch (err) {
        console.error("Error evaluating with huggingFace:", err);
        throw err;
    }
};