import { useParametersStore } from "../../stores/parameters";
import { Checkbox, ColorInput } from "@mantine/core";

export function RenderColorInput() {
    const color = useParametersStore(state => state.inputs.color);
    const showContributionColor = useParametersStore(state => state.inputs.showContributionColor);
    const setInputs = useParametersStore(state => state.setInputs);

    return (
        <>
            <ColorInput
                label="Render Color"
                value={color}
                disabled={showContributionColor}
                onChange={(color) => setInputs({ color })}
            />
            <Checkbox
                label="Show Contribution Colors"
                checked={showContributionColor}
                onChange={() =>
                    setInputs({
                        showContributionColor:
                            !showContributionColor,
                    })
                }
            />
        </>
    )
}