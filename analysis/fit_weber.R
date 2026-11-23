# fit_weber.R  -  DyscalcBattery v1.1 analysis (base R only, no packages needed)
#
# Usage:
#   source("analysis/fit_weber.R")
#   res <- summarise_battery("data/")          # folder of session CSV files
#   write.csv(res, "participant_summary.csv", row.names = FALSE)
#
# One row per participant with:
#   srt_median_rt          median simple RT (ms), valid trials only
#   dotenum_*              accuracy, subitizing slope (1-3) and counting slope (5-9), ms/item
#   numcomp_*              accuracy, median RT, distance-effect slope (ms per unit distance)
#   w_<task>, acc_<task>   Weber fraction and accuracy for dotnum/objnum/shapenum/colour
#   flag_<task>            "ok" or a data-quality warning
#
# Weber model (Halberda & Feigenson, 2008; Pica et al., 2004), larger n1 vs smaller n2:
#   P(correct) = Phi( (n1 - n2) / (w * sqrt(n1^2 + n2^2)) )
# Note: the simplified form Phi((r - 1) / (w * sqrt(2))) used in the v1.0 README is only
# accurate for ratios near 1 and overstates accuracy at larger ratios; do not use it.

read_battery <- function(dir) {
  files <- list.files(dir, pattern = "\\.csv$", full.names = TRUE)
  files <- files[!grepl("^DEMO_", basename(files))]          # never analyse training sessions
  if (!length(files)) stop("No CSV files found in ", dir)
  d <- do.call(rbind, lapply(files, function(f) {
    # force text columns to stay text: otherwise R reads sex "F" as the logical FALSE
    txt <- c(participant_id = "character", school_code = "character", experimenter = "character",
             sex = "character", response = "character", reported_number = "character")
    x <- read.csv(f, na.strings = "NA", stringsAsFactors = FALSE, colClasses = txt)
    x$source_file <- basename(f); x
  }))
  d[d$phase == "main", ]
}

fit_weber_one <- function(n1, n2, correct) {
  # n1 = larger count, n2 = smaller count, correct = 0/1
  ok <- !is.na(correct)
  n1 <- n1[ok]; n2 <- n2[ok]; y <- correct[ok]
  if (length(y) < 20) return(NA_real_)
  z <- (n1 - n2) / sqrt(n1^2 + n2^2)
  nll <- function(logw) {
    p <- pnorm(z / exp(logw)); p <- pmin(pmax(p, 1e-6), 1 - 1e-6)
    -sum(y * log(p) + (1 - y) * log(1 - p))
  }
  fit <- optimize(nll, interval = log(c(0.02, 3)))
  w <- exp(fit$minimum)
  if (w > 2.9) w <- Inf          # at chance: Weber fraction not identifiable
  w
}

slope <- function(x, y) {
  ok <- !is.na(x) & !is.na(y)
  if (sum(ok) < 4 || length(unique(x[ok])) < 2) return(NA_real_)
  unname(coef(lm(y[ok] ~ x[ok]))[2])
}

summarise_participant <- function(p) {
  out <- data.frame(participant_id = p$participant_id[1], school_code = p$school_code[1],
                    class_grade = p$class_grade[1], age = p$age[1], sex = p$sex[1],
                    order_group = p$order_group[1], stringsAsFactors = FALSE)
  s <- p[p$task == "srt" & p$correct %in% 1, ]
  out$srt_median_rt <- if (nrow(s)) median(s$rt) else NA
  out$srt_anticipation_rate <- mean(p$anticipation[p$task == "srt"] %in% 1)

  e <- p[p$task == "dotenum", ]
  out$dotenum_acc <- if (nrow(e)) mean(e$correct, na.rm = TRUE) else NA
  ec <- e[e$correct %in% 1 & !is.na(e$rt), ]
  out$dotenum_subitizing_slope <- slope(ec$set_size[ec$set_size <= 3], ec$rt[ec$set_size <= 3])
  out$dotenum_counting_slope   <- slope(ec$set_size[ec$set_size >= 5 & ec$set_size <= 9],
                                        ec$rt[ec$set_size >= 5 & ec$set_size <= 9])

  n <- p[p$task == "numcomp", ]
  out$numcomp_acc <- if (nrow(n)) mean(n$correct, na.rm = TRUE) else NA
  nc <- n[n$correct %in% 1 & !is.na(n$rt), ]
  out$numcomp_median_rt <- if (nrow(nc)) median(nc$rt) else NA
  out$numcomp_distance_slope <- slope(nc$distance, nc$rt)

  for (t in c("dotnum", "objnum", "shapenum", "colour")) {
    x <- p[p$task == t, ]
    if (!nrow(x)) { out[[paste0("w_", t)]] <- NA; out[[paste0("acc_", t)]] <- NA; out[[paste0("flag_", t)]] <- "not run"; next }
    if (t == "colour") { a <- x$colours_left; b <- x$colours_right } else { a <- x$n_left; b <- x$n_right }
    good <- is.na(x$items_drawn_ok) | x$items_drawn_ok == 1
    w <- fit_weber_one(pmax(a, b)[good], pmin(a, b)[good], x$correct[good])
    acc <- mean(x$correct, na.rm = TRUE)
    easy <- mean(x$correct[x$ratio_actual >= 1.9], na.rm = TRUE)
    flag <- "ok"
    if (mean(x$timed_out %in% 1) > 0.2) flag <- "many timeouts (>20%)"
    if (!is.na(easy) && easy < 0.6) flag <- "near chance on easiest ratio - check key use"
    if (is.infinite(w)) flag <- "at chance overall - Weber fraction not estimable"
    out[[paste0("w_", t)]] <- w; out[[paste0("acc_", t)]] <- acc; out[[paste0("flag_", t)]] <- flag
  }
  out
}

summarise_battery <- function(dir) {
  d <- read_battery(dir)
  do.call(rbind, lapply(split(d, d$participant_id), summarise_participant))
}
