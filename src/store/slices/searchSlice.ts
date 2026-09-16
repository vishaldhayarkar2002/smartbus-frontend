import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_JOURNEY_DATE } from "@/data/mockData";
import type { SearchQuery } from "@/types";

const initialState: SearchQuery = {
  from: "Pune",
  to: "Mumbai",
  journeyDate: DEFAULT_JOURNEY_DATE,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch(_state, action: PayloadAction<SearchQuery>) {
      return action.payload;
    },
    swapCities(state) {
      const { from, to } = state;
      state.from = to;
      state.to = from;
    },
  },
});

export const { setSearch, swapCities } = searchSlice.actions;
export default searchSlice.reducer;
