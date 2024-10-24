import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { format } from "date-fns";
import axios from "axios";
import { evaluate } from "mathjs";

// 型定義
type FormValues = {
  productLot: string;
  inspector: string;
  inspectionDate: string;
  custom_fields: {
    [key: string]: number; // string型のキーを許容
  };
  inspectionFile?: FileList;
};

type CustomFormField = {
  item: keyof FormValues | string;
  type: string;
  display_name: string;
  component_type: "input" | "auto_post" | "calculate" | "file_input";
  formula?: string;
  isInspectionData?: boolean;
};

// Categoryコンポーネント
const Category: React.FC = () => {
  const [customForm, setCustomForm] = useState<CustomFormField[]>([]);
  const [formRows, setFormRows] = useState<FormValues[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // customFormをバックエンドから取得
  useEffect(() => {
    const fetchCustomForm = async () => {
      try {
        const response = await axios.get<CustomFormField[]>(
          "http://localhost:8000/api/api/customForm"
        ); // バックエンドのエンドポイントに合わせて修正
        setCustomForm(response.data);
        initializeFormRows(response.data);
        setLoading(false);
      } catch (err) {
        console.error("customFormの取得中にエラーが発生しました:", err);
        setError("フォームの初期化に失敗しました。再試行してください。");
        setLoading(false);
      }
    };

    fetchCustomForm();
  }, []);

  // フォーム行の初期化
  const initializeFormRows = (formFields: CustomFormField[]) => {
    const initialCustomFields: { [key: string]: number } = {};

    formFields.forEach((field) => {
      if (
        field.component_type === "auto_post" ||
        field.component_type === "calculate"
      ) {
        initialCustomFields[field.item] = 0;
      }
    });

    setFormRows([
      {
        productLot: "",
        inspector: "",
        inspectionDate: format(new Date(), "yyyy-MM-dd"),
        custom_fields: { ...initialCustomFields },
      },
    ]);
  };

  // フィールド変更ハンドラー
  const handleRowChange = useCallback(
    (index: number, field: keyof FormValues | string, value: any) => {
      setFormRows((prev) => {
        const updatedRows = [...prev];
        if (field.startsWith("custom_fields.")) {
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
    },
    []
  );

  // 計算フィールドの計算
  const calculateFormula = useCallback(
    (index: number, formulaField: CustomFormField) => {
      const customFields = formRows[index].custom_fields;
      const formula = formulaField.formula;

      if (formula) {
        try {
          const result = evaluate(formula, customFields);
          setFormRows((prev) => {
            const updatedRows = [...prev];
            updatedRows[index] = {
              ...updatedRows[index],
              custom_fields: {
                ...updatedRows[index].custom_fields,
                [formulaField.item]: result,
              },
            };
            return updatedRows;
          });
        } catch (err) {
          console.error("計算式の評価中にエラーが発生しました:", err);
          setError(
            `計算式 "${formulaField.display_name}" の評価中にエラーが発生しました。`
          );
        }
      }
    },
    [formRows]
  );

  // 計算式の適用
  useEffect(() => {
    if (customForm.length === 0) return;

    customForm
      .filter((field) => field.component_type === "calculate")
      .forEach((formulaField) => {
        formRows.forEach((_, index) => {
          calculateFormula(index, formulaField);
        });
      });
  }, [formRows, customForm, calculateFormula]);

  // フォーム行の追加
  const addFormRow = () => {
    const initialCustomFields: { [key: string]: number } = {};

    customForm.forEach((field) => {
      if (
        field.component_type === "auto_post" ||
        field.component_type === "calculate"
      ) {
        initialCustomFields[field.item] = 0;
      }
    });

    setFormRows((prev) => [
      ...prev,
      {
        productLot: "",
        inspector: "",
        inspectionDate: format(new Date(), "yyyy-MM-dd"),
        custom_fields: { ...initialCustomFields },
      },
    ]);
  };

  // フォーム送信ハンドラー
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // 出力用のデータをJSON化してコンソールに表示
    const submissionData = formRows.map((row) => ({
      ...row,
      custom_fields: { ...row.custom_fields },
    }));

    console.log(JSON.stringify(submissionData, null, 2));
    // 必要に応じてバックエンドへ送信
  };

  // ローディング中の表示
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
        <Grid
          container
          spacing={2}
          key={index}
          sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}
        >
          {customForm.map((field) => (
            <Grid item xs={12} sm={6} key={field.item}>
              {field.component_type === "input" && (
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  type={field.type}
                  InputLabelProps={
                    field.type === "date" ? { shrink: true } : {}
                  }
                  value={(row as any)[field.item] || ""}
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
                    value={row.custom_fields[field.item] || ""}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        `custom_fields.${field.item}`,
                        parseFloat(e.target.value) || 0
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
                    row.custom_fields[field.item] !== undefined
                      ? row.custom_fields[field.item]
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
                  inputProps={{ multiple: true }}
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

      {/* エラーメッセージのSnackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Category;
