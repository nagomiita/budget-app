import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import { format } from "date-fns";

type FormValues = {
  productLot: string;
  inspector: string;
  inspectionDate: string;
  custom_fields: {
    [key: string]: number;
  };
  formula: string;
  inspectionFile?: FileList;
};

type CustomFormField = {
  item: keyof FormValues | string;
  type: string;
  display_name: string;
  component_type: "input" | "auto_post" | "calculate" | "file_input";
  required: boolean;
  formula?: string;
  isInspectionData?: boolean;
};

const customForm: CustomFormField[] = [
  {
    item: "productLot",
    type: "text",
    display_name: "製品ロット",
    component_type: "input",
    required: true,
  },
  {
    item: "inspector",
    type: "text",
    display_name: "検査者",
    component_type: "input",
    required: true,
  },
  {
    item: "inspectionDate",
    type: "date",
    display_name: "検査日",
    component_type: "input",
    required: true,
  },
  {
    item: "inspectionData1",
    type: "number",
    display_name: "検査データ1",
    component_type: "auto_post",
    required: true,
    isInspectionData: true,
  },
  {
    item: "inspectionData2",
    type: "number",
    display_name: "検査データ2",
    component_type: "auto_post",
    required: true,
    isInspectionData: true,
  },
  {
    item: "formula",
    type: "text",
    display_name: "計算式",
    component_type: "calculate",
    required: true,
    formula: "inspectionData1 * inspectionData2",
  },
  {
    item: "inspectionFile",
    type: "file",
    display_name: "検査データファイル",
    component_type: "file_input",
    required: true,
  },
];

const Category: React.FC = () => {
  const [formRows, setFormRows] = useState<FormValues[]>([
    {
      productLot: "",
      inspector: "",
      inspectionDate: format(new Date(), "yyyy-MM-dd"),
      custom_fields: {
        inspectionData1: 0,
        inspectionData2: 0,
      },
      formula: "",
    },
  ]);

  const [calculatedResults, setCalculatedResults] = useState<number[]>([]);

  const handleRowChange = (
    index: number,
    field: keyof FormValues | string,
    value: any
  ) => {
    setFormRows((prev) => {
      const updatedRows = [...prev];
      if (field.includes("custom_fields.")) {
        const customField = field.split(".")[1];
        updatedRows[index] = {
          ...updatedRows[index],
          custom_fields: {
            ...updatedRows[index].custom_fields,
            [customField]: value,
          },
        };
      } else {
        updatedRows[index] = { ...updatedRows[index], [field]: value };
      }
      return updatedRows;
    });
  };

  const calculateFormula = (index: number) => {
    const { inspectionData1, inspectionData2 } = formRows[index].custom_fields;
    const formula = customForm.find(
      (field) => field.item === "formula"
    )?.formula;

    try {
      const result = Function(
        "inspectionData1",
        "inspectionData2",
        `return ${formula}`
      )(inspectionData1, inspectionData2);
      setCalculatedResults((prev) => {
        const updatedResults = [...prev];
        updatedResults[index] = result;
        return updatedResults;
      });
    } catch (error) {
      console.error("計算式の評価中にエラーが発生しました:", error);
    }
  };

  useEffect(() => {
    formRows.forEach((_, index) => {
      calculateFormula(index);
    });
  }, [formRows]);

  const addFormRow = () => {
    setFormRows((prev) => [
      ...prev,
      {
        productLot: "",
        inspector: "",
        inspectionDate: format(new Date(), "yyyy-MM-dd"),
        custom_fields: {
          inspectionData1: 0,
          inspectionData2: 0,
        },
        formula: "inspectionData1 * inspectionData2",
      },
    ]);
    setCalculatedResults((prev) => [...prev, 0]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(JSON.stringify(formRows, null, 2));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
        検査フォーム
      </Typography>
      {formRows.map((row, index) => (
        <Grid container spacing={2} key={index}>
          {customForm.map((field) => (
            <Grid item xs={6} key={field.item}>
              {field.component_type === "input" && (
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  type={field.type}
                  InputLabelProps={
                    field.type === "date" ? { shrink: true } : {}
                  }
                  value={row[field.item as keyof FormValues] || ""}
                  onChange={(e) =>
                    handleRowChange(index, field.item, e.target.value)
                  }
                />
              )}

              {field.component_type === "auto_post" && (
                <Box display="flex" alignItems="center">
                  <TextField
                    label={field.display_name}
                    variant="outlined"
                    fullWidth
                    type={field.type}
                    value={row.custom_fields[field.item as string] || ""}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        `custom_fields.${field.item}`,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleRowChange(index, `custom_fields.${field.item}`, 100)
                    }
                    sx={{ ml: 2 }}
                  >
                    自動取得
                  </Button>
                </Box>
              )}

              {field.component_type === "calculate" && (
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  value={
                    calculatedResults[index] !== null
                      ? calculatedResults[index]
                      : ""
                  }
                  InputProps={{ readOnly: true }}
                />
              )}

              {field.component_type === "file_input" && (
                <TextField
                  type="file"
                  variant="outlined"
                  fullWidth
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      field.item,
                      (e.target as HTMLInputElement).files
                    )
                  }
                />
              )}
            </Grid>
          ))}
        </Grid>
      ))}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={addFormRow}
          fullWidth
        >
          行を追加
        </Button>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          送信
        </Button>
      </Box>
    </Box>
  );
};

export default Category;
