"""
Convert PyTorch ResNet18 ASL model to ONNX for browser inference.
"""
import torch
import torch.nn as nn
from torchvision import models

class SignLanguageModel(nn.Module):
    def __init__(self, num_classes=26, pretrained=False):
        super().__init__()
        self.model = models.resnet18(pretrained=pretrained)
        self.model.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        return self.model(x)

# Load checkpoint
device = torch.device("cpu")
model = SignLanguageModel(num_classes=26)
checkpoint = torch.load("best_model.pth", map_location=device, weights_only=False)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()
print(f"Model loaded! Val accuracy: {checkpoint.get('val_acc', 'N/A')}")

# Create dummy input (batch=1, 3 channels, 224x224)
dummy_input = torch.randn(1, 3, 224, 224)

# Export to ONNX
output_path = "public/asl_resnet18.onnx"
torch.onnx.export(
    model,
    dummy_input,
    output_path,
    opset_version=13,
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "output": {0: "batch_size"},
    },
)

import os
size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"✅ ONNX model exported to {output_path} ({size_mb:.1f} MB)")
